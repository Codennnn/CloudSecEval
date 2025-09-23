import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useLocalStorage } from './useLocalStorage'

import { departmentsControllerGetDepartmentOnlineStatsOptions } from '~api/@tanstack/react-query.gen'
import type { DepartmentOnlineStatsDto } from '~api/types.gen'
import { getTeamRole, isBlueTeam, isRedTeam, teamConfig } from '~crowd-test/constants'

interface MockDataState {
  baseTimestamp: number
  targetTotal: number
  departmentOffsets: Record<string, number>
}

interface TeamOnlineData {
  name: string
  value: number
  fill: string
}

const MOCK_UPDATE_INTERVAL = 8 * 60 * 1000 // 8分钟更新一次
const TARGET_MIN = 10
const TARGET_MAX = 20

/**
 * 生成随机的目标总人数和部门偏移
 */
function generateMockData(departments: DepartmentOnlineStatsDto[] = []): MockDataState {
  const targetTotal = Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN

  // 为每个部门生成随机偏移量
  const departmentOffsets: Record<string, number> = {}
  departments.forEach((d) => {
    if (isRedTeam(d.department.remark) || isBlueTeam(d.department.remark)) {
      // 每个部门随机增减 0-3 人
      departmentOffsets[d.department.id] = Math.floor(Math.random() * 7) - 3
    }
  })

  return {
    baseTimestamp: Date.now(),
    targetTotal,
    departmentOffsets,
  }
}

/**
 * 调整部门数据以达到目标总人数
 */
function adjustDepartmentData(
  departments: DepartmentOnlineStatsDto[],
  targetTotal: number,
  departmentOffsets: Record<string, number>,
): DepartmentOnlineStatsDto[] {
  const validDepartments = departments.filter((d) =>
    isRedTeam(d.department.remark) || isBlueTeam(d.department.remark),
  )

  if (validDepartments.length === 0) {
    return departments
  }

  // 先应用部门偏移
  const adjustedDepartments = departments.map((d) => {
    if (!(isRedTeam(d.department.remark) || isBlueTeam(d.department.remark))) {
      return d
    }

    const offset = departmentOffsets[d.department.id] || 0
    const newOnline = Math.max(0, d.online + offset)

    return {
      ...d,
      online: newOnline,
    }
  })

  // 计算当前总数
  const currentTotal = adjustedDepartments
    .filter((d) => isRedTeam(d.department.remark) || isBlueTeam(d.department.remark))
    .reduce((sum, d) => sum + d.online, 0)

  // 如果当前总数与目标相差太大，进行二次调整
  const diff = targetTotal - currentTotal

  if (Math.abs(diff) > 0) {
    const validDepts = adjustedDepartments.filter((d) =>
      isRedTeam(d.department.remark) || isBlueTeam(d.department.remark),
    )

    // 平均分配差值
    const avgAdjust = Math.floor(diff / validDepts.length)
    const remainder = diff % validDepts.length

    return adjustedDepartments.map((d) => {
      if (!(isRedTeam(d.department.remark) || isBlueTeam(d.department.remark))) {
        return d
      }

      const deptIndex = validDepts.findIndex((vd) => vd.department.id === d.department.id)
      const extraAdjust = deptIndex < remainder ? 1 : 0
      const finalOnline = Math.max(0, d.online + avgAdjust + extraAdjust)

      return {
        ...d,
        online: finalOnline,
      }
    })
  }

  return adjustedDepartments
}

export function useTeamOnlineStats() {
  const [mockData, setMockData] = useLocalStorage<MockDataState>('team-online-mock-data')
  const [shouldRefreshMock, setShouldRefreshMock] = useState(false)

  const { data: originalData, ...queryResult } = useQuery({
    ...departmentsControllerGetDepartmentOnlineStatsOptions(),
  })

  // 检查是否需要更新模拟数据
  useEffect(() => {
    if (!originalData?.data.departments) {
      return
    }

    const now = Date.now()
    const shouldUpdate = !mockData
      || (now - mockData.baseTimestamp) > MOCK_UPDATE_INTERVAL
      || shouldRefreshMock

    if (shouldUpdate) {
      const newMockData = generateMockData(originalData.data.departments)
      setMockData(newMockData)
      setShouldRefreshMock(false)
    }
  }, [originalData, mockData, setMockData, shouldRefreshMock])

  // 设置定时器检查更新
  useEffect(() => {
    const timer = setInterval(() => {
      setShouldRefreshMock(true)
    }, MOCK_UPDATE_INTERVAL)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // 处理调整后的数据
  const adjustedData = originalData && mockData
    ? {
        ...originalData,
        data: {
          ...originalData.data,
          departments: adjustDepartmentData(
            originalData.data.departments,
            mockData.targetTotal,
            mockData.departmentOffsets,
          ),
        },
      }
    : originalData

  // 生成团队在线数据（用于饼图）
  const teamOnlineData: TeamOnlineData[] = adjustedData?.data.departments
    ? adjustedData.data.departments
        .filter((d) => d.online > 0
          && (isRedTeam(d.department.remark) || isBlueTeam(d.department.remark)))
        .map((d) => {
          const role = getTeamRole(d.department.remark)

          return {
            name: d.department.name,
            value: d.online,
            fill: teamConfig[role].colorValue,
          }
        })
    : []

  const totalOnline = teamOnlineData.reduce((sum, d) => sum + d.value, 0)

  return {
    data: adjustedData,
    teamOnlineData,
    totalOnline,
    ...queryResult,
  }
}
