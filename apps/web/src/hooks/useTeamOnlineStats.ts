import { useEffect, useState } from 'react'

import { useLocalStorage } from './useLocalStorage'

import type { DepartmentOnlineStatsDto } from '~api/types.gen'
import { getTeamRole, isRedTeam, teamConfig } from '~crowd-test/constants'

const teamData: DepartmentOnlineStatsDto[] = [
  {
    department: {
      id: '1',
      name: '广东网安科技攻击队 1',
      remark: '红队',
    },
    online: 3,
  },
  {
    department: {
      id: '2',
      name: '广东网安科技攻击队 2',
      remark: '红队',
    },
    online: 230,
  },
  {
    department: {
      id: '3',
      name: '众测团队',
      remark: '红队',
    },
    online: 8,
  },
]

interface MockDataState {
  baseTimestamp: number
  targetTotal: number
  departmentOffsets: Record<string, number>
}

interface CrowdTestTeamState {
  lastUpdateTime: number
  currentOnline: number
}

interface TeamOnlineData {
  name: string
  value: number
  fill: string
}

const MOCK_UPDATE_INTERVAL = 8 * 60 * 1000 // 8分钟更新一次
const RED_TEAM_MIN = 10 // 红队最小在线人数
const RED_TEAM_MAX = 20 // 红队最大在线人数
const CROWD_TEST_UPDATE_INTERVAL = 30 * 1000 // 众测团队30秒更新一次
const CROWD_TEST_MIN = 10 // 众测团队最小在线人数
const CROWD_TEST_MAX = 20 // 众测团队最大在线人数
const CROWD_TEST_TEAM_ID = '3' // 众测团队的ID

/**
 * 生成众测团队动态在线人数
 */
function generateCrowdTestOnline(): number {
  return Math.floor(Math.random() * (CROWD_TEST_MAX - CROWD_TEST_MIN + 1)) + CROWD_TEST_MIN
}

/**
 * 生成红队目标总人数和部门分配
 */
function generateMockData(departments: DepartmentOnlineStatsDto[] = []): MockDataState {
  // 生成红队目标总人数（10-20人）
  const targetTotal = Math.floor(Math.random() * (RED_TEAM_MAX - RED_TEAM_MIN + 1)) + RED_TEAM_MIN

  // 获取所有红队部门
  const redTeamDepartments = departments.filter((d) => isRedTeam(d.department.remark))

  // 为每个红队部门分配人数
  const departmentOffsets: Record<string, number> = {}

  if (redTeamDepartments.length > 0) {
    // 平均分配基础人数
    const basePerDept = Math.floor(targetTotal / redTeamDepartments.length)
    const remainder = targetTotal % redTeamDepartments.length

    redTeamDepartments.forEach((d, index) => {
      // 基础人数 + 余数分配（前面的部门多分配1人）
      const allocatedCount = basePerDept + (index < remainder ? 1 : 0)
      // 相对于原始数据的偏移量
      departmentOffsets[d.department.id] = allocatedCount - d.online
    })
  }

  return {
    baseTimestamp: Date.now(),
    targetTotal,
    departmentOffsets,
  }
}

/**
 * 应用模拟数据调整部门在线人数
 */
function adjustDepartmentData(
  departments: DepartmentOnlineStatsDto[],
  targetTotal: number,
  departmentOffsets: Record<string, number>,
  crowdTestOnline?: number,
): DepartmentOnlineStatsDto[] {
  return departments.map((d) => {
    // 只调整红队部门
    if (!isRedTeam(d.department.remark)) {
      return d
    }

    // 如果是众测团队且有动态在线人数，使用动态值
    if (d.department.id === CROWD_TEST_TEAM_ID && crowdTestOnline !== undefined) {
      return {
        ...d,
        online: crowdTestOnline,
      }
    }

    const offset = departmentOffsets[d.department.id] || 0
    const newOnline = Math.max(0, d.online + offset)

    return {
      ...d,
      online: newOnline,
    }
  })
}

export function useTeamOnlineStats() {
  const [mockData, setMockData] = useLocalStorage<MockDataState>('team-online-mock-data')
  const [shouldRefreshMock, setShouldRefreshMock] = useState(false)
  const [crowdTestState, setCrowdTestState] = useLocalStorage<CrowdTestTeamState>('crowd-test-team-state')
  const [currentCrowdTestOnline, setCurrentCrowdTestOnline] = useState<number>()

  // 检查是否需要更新模拟数据
  useEffect(() => {
    const now = Date.now()
    const shouldUpdate = !mockData
      || (now - mockData.baseTimestamp) > MOCK_UPDATE_INTERVAL
      || shouldRefreshMock

    if (shouldUpdate) {
      const newMockData = generateMockData(teamData)
      setMockData(newMockData)
      setShouldRefreshMock(false)
    }
  }, [mockData, setMockData, shouldRefreshMock])

  // 检查是否需要更新众测团队在线人数
  useEffect(() => {
    const now = Date.now()
    const shouldUpdateCrowdTest = !crowdTestState
      || (now - crowdTestState.lastUpdateTime) > CROWD_TEST_UPDATE_INTERVAL

    if (shouldUpdateCrowdTest) {
      const newOnline = generateCrowdTestOnline()
      const newState: CrowdTestTeamState = {
        lastUpdateTime: now,
        currentOnline: newOnline,
      }
      setCrowdTestState(newState)
      setCurrentCrowdTestOnline(newOnline)
    }
    else {
      // 使用已存储的值
      setCurrentCrowdTestOnline(crowdTestState.currentOnline)
    }
  }, [crowdTestState, setCrowdTestState])

  // 设置定时器检查更新
  useEffect(() => {
    const timer = setInterval(() => {
      setShouldRefreshMock(true)
    }, MOCK_UPDATE_INTERVAL)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // 设置众测团队定时器
  useEffect(() => {
    const timer = setInterval(() => {
      const newOnline = generateCrowdTestOnline()
      const newState: CrowdTestTeamState = {
        lastUpdateTime: Date.now(),
        currentOnline: newOnline,
      }
      setCrowdTestState(newState)
      setCurrentCrowdTestOnline(newOnline)
    }, CROWD_TEST_UPDATE_INTERVAL)

    return () => {
      clearInterval(timer)
    }
  }, [setCrowdTestState])

  // 处理调整后的数据
  const adjustedData = mockData
    ? {
        data: {
          departments: adjustDepartmentData(
            teamData,
            mockData.targetTotal,
            mockData.departmentOffsets,
            currentCrowdTestOnline,
          ),
        },
      }
    : {
        data: {
          departments: adjustDepartmentData(
            teamData,
            0,
            {},
            currentCrowdTestOnline,
          ),
        },
      }

  // 生成团队在线数据（用于饼图）
  const teamOnlineData: TeamOnlineData[] = adjustedData.data.departments
    .filter((d) => d.online > 0
      && isRedTeam(d.department.remark))
    .map((d) => {
      const role = getTeamRole(d.department.remark)

      return {
        name: d.department.name,
        value: d.online,
        fill: teamConfig[role].colorValue,
      }
    })

  // 计算所有红队部门的总在线人数（包括在线人数为0的部门）
  const totalOnline = adjustedData.data.departments
    .filter((d) => isRedTeam(d.department.remark))
    .reduce((sum, d) => sum + d.online, 0)

  return {
    data: adjustedData,
    teamOnlineData,
    totalOnline,
    isLoading: false,
    isError: false,
    error: null,
  }
}
