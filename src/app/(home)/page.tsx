'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Coffee, Gift, Lightbulb, RotateCcw, Star, Workflow } from 'lucide-react'

import { Button } from '~/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href="/">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-lg">
                NestJS 中文文档
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <button
                className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                特色功能
              </button>
              <button
                className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                onClick={() => {
                  document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                适用人群
              </button>
              <button
                className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                onClick={() => {
                  document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                支持项目
              </button>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button asChild size="sm" variant="ghost">
                <Link href="/docs">开始阅读</Link>
              </Button>
              <Button
                size="sm"
                onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}
              >
                支持项目
              </Button>
            </div>

            {/* Mobile Action Button */}
            <div className="md:hidden">
              <Button asChild size="sm">
                <Link href="/docs">开始阅读</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6">
              🎉 社区开发者维护的高质量中文文档
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              NestJS 中文文档
              <br />
              <span className="text-primary">精校版 · 优化阅读体验</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              让中文开发者轻松掌握 NestJS 框架的最佳学习资源。不用翻墙、不看生涩英文，也能轻松学会 NestJS。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href="/docs">
                  <BookOpen className="mr-2 h-4 w-4" />
                  立即开始学习
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto" size="lg" variant="outline">
                <Link href="/docs">
                  查看目录
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50 dark:bg-transparent" id="features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              为什么选择我们的文档？
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              我们不仅仅做了翻译，更进行了全方位的优化和提升
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">逐句校对润色</h3>
              <p className="text-sm text-muted-foreground">
                确保语义准确、通顺自然，让阅读体验更流畅
              </p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">阅读体验优化</h3>
              <p className="text-sm text-muted-foreground">
                结构更清晰，目录更易用，跳转导航快速直达
              </p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">持续更新同步</h3>
              <p className="text-sm text-muted-foreground">
                跟进官方版本更新，保持内容新鲜和准确性
              </p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">实战场景补充</h3>
              <p className="text-sm text-muted-foreground">
                配套示例代码、实用小贴士、实战场景补充
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24" id="audience">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              这个站点适合你吗？
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              如果你符合以下任一情况，这里就是你的理想学习平台
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">英文阅读困难</h3>
              <p className="text-muted-foreground">
                英文阅读能力一般，但想快速上手 NestJS 的开发者
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">追求优质体验</h3>
              <p className="text-muted-foreground">
                喜欢结构清晰、页面美观、交互顺滑的学习资源爱好者
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center mb-6">
                <ArrowRight className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">高效学习者</h3>
              <p className="text-muted-foreground">
                喜欢站在巨人肩膀上学习，节省时间的你
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-background rounded-xl border p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                为什么不全免费？
              </h2>
              <p className="text-lg text-muted-foreground sm:text-xl">
                我们的目标是构建一个真正适合中文开发者的 NestJS 入门站点
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6">我们的投入</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">逐句语义校对与润色</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">页面架构优化与交互设计</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">内容结构重组与实战化整理</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">跨版本对比与实时同步</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6">我们的理念</h3>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                  <p className="font-medium text-lg mb-3">
                    优质内容 + 贴心体验 = 有价值的知识服务
                  </p>
                  <p className="text-muted-foreground">
                    我们相信，认真打磨的内容值得被认真对待和支持
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24" id="support">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              支持我们，你将获得
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              你的每一次赞助，都是对优质内容创作者最好的鼓励
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="font-bold text-lg mb-2">全站解锁</h3>
              <p className="text-sm text-muted-foreground">全部章节完整访问权限</p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="font-bold text-lg mb-2">离线文档</h3>
              <p className="text-sm text-muted-foreground">可下载的PDF版本（开发中）</p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-bold text-lg mb-2">专属资源</h3>
              <p className="text-sm text-muted-foreground">实战技巧与项目结构建议</p>
            </div>
            <div className="bg-background rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="font-bold text-lg mb-2">更新提醒</h3>
              <p className="text-sm text-muted-foreground">内容更新邮件推送订阅</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="w-full sm:w-auto" size="lg">
              <Gift className="mr-2 h-4 w-4" />
              赞助解锁全部内容
            </Button>
            <Button className="w-full sm:w-auto" size="lg" variant="outline">
              <Coffee className="mr-2 h-4 w-4" />
              Buy Me a Coffee
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              准备开始你的 NestJS 学习之旅？
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8">
              立即体验最好的中文 NestJS 文档
            </p>
            <Button asChild className="w-full sm:w-auto" size="lg" variant="secondary">
              <Link href="/docs">
                <BookOpen className="mr-2 h-4 w-4" />
                立即开始免费阅读
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">N</span>
                </div>
                <span className="font-bold text-lg">NestJS 中文文档</span>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                🌟 本站非官方文档，仅作学习辅助之用。原文内容版权归 NestJS 官方团队所有，
                本项目基于开源协议，在原文基础上进行翻译、润色与扩展整理，感谢 NestJS 官方团队的付出。
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
              <p className="text-muted-foreground text-sm mb-4 md:mb-0">
                © 2024 NestJS 中文文档项目. 基于开源协议构建.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link className="text-muted-foreground hover:text-foreground transition-colors text-sm" href="#">
                  关于项目
                </Link>
                <Link className="text-muted-foreground hover:text-foreground transition-colors text-sm" href="#">
                  联系我们
                </Link>
                <Link className="text-muted-foreground hover:text-foreground transition-colors text-sm" href="#">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
