import { CalloutInfo } from '~/components/doc/CalloutInfo'

export function BugReportGuidelines() {
  return (
    <div className="space-y-4 rounded-lg border p-5">
      <div>
        <h2 className="text-base font-semibold leading-none">漏洞提交规则说明</h2>
        <p className="mt-1 text-sm text-muted-foreground">提交前请先仔细阅读以下说明，确保信息完整与准确。</p>
      </div>

      <CalloutInfo title="请选择正确的漏洞类别" type="warning">
        <div className="space-y-2 text-sm">
          <p>为避免影响审核结果，请务必选择正确的漏洞类别：</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Web 漏洞</li>
            <li>App 漏洞</li>
            <li>IoT 漏洞</li>
            <li>工控 漏洞</li>
            <li>操作系统及通用软件 漏洞</li>
          </ul>
          <p>专属 SRC 漏洞请准确填写企业名称；该类漏洞类别统一选择 Web（系统会自动选择）。</p>
        </div>
      </CalloutInfo>

      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">漏洞详情（必填）</h3>
        <div className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              基础信息：请给出漏洞利用的完整过程，并提供相关 URL、截图、代码与 PoC。
              若不符合规则，漏洞可能审核不通过。
            </li>
            <li>
              IoT 漏洞需补充：
              <ul className="mt-1 list-[circle] space-y-1 pl-5">
                <li>漏洞触发对应的二进制位置</li>
                <li>目标配置情况</li>
                <li>
                  漏洞研究环境：若为真实硬件设备，请提供购买链接；若为模拟仿真，需描述环境搭建与调试方法。
                </li>
              </ul>
            </li>
            <li>若在利用过程中使用到组件，请提供下载链接，或将组件压缩后在附件处上传。</li>
            <li>复杂漏洞可提供攻击过程的视频/图片：图片可在详情中上传；视频请提供链接或压缩后在附件处上传。</li>
            <li>PoC/Exp 语言不限，但需思路清晰、可读性高且易于复现。</li>
          </ul>
        </div>
      </div>

      <CalloutInfo title="附件上传说明" type="info">
        <div className="space-y-2 text-sm">
          <p>附件仅支持上传压缩后的组件 / 固件 / 视频等。如文件较大，请在漏洞详情中提供链接。</p>
          <p className="">请注意：漏洞详情必须在“详细细节”字段中完整填写，不能仅上传至附件中。</p>
        </div>
      </CalloutInfo>
    </div>
  )
}
