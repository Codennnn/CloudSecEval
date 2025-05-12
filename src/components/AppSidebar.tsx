import Link from 'next/link'
import { GalleryVerticalEnd, Minus, Plus } from 'lucide-react'

import { SearchForm } from '@/components/SearchForm'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  url: string
  isActive?: boolean
}

interface NavSection {
  title: string
  url: string
  items: NavItem[]
}

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Introduction',
      url: '/',
      items: [],
    },
    {
      title: 'Overview',
      url: '#',
      items: [
        { title: 'First steps', url: '/first-steps' },
        { title: 'Controllers', url: '/controllers' },
        { title: 'Providers', url: '/providers' },
        { title: 'Modules', url: '/modules' },
        { title: 'Middleware', url: '/middleware' },
        { title: 'Exception filters', url: '/exception-filters' },
        { title: 'Pipes', url: '/pipes' },
        { title: 'Guards', url: '/guards' },
        { title: 'Interceptors', url: '/interceptors' },
        { title: 'Custom decorators', url: '/custom-decorators' },
      ],
    },
    {
      title: 'Fundamentals',
      url: '#',
      items: [
        { title: 'Custom providers', url: '/fundamentals/custom-providers' },
        { title: 'Asynchronous providers', url: '/fundamentals/async-providers' },
        { title: 'Dynamic modules', url: '/fundamentals/dynamic-modules' },
        { title: 'Injection scopes', url: '/fundamentals/injection-scopes' },
        { title: 'Circular dependency', url: '/fundamentals/circular-dependency' },
        { title: 'Module reference', url: '/fundamentals/module-ref' },
        { title: 'Lazy-loading modules', url: '/fundamentals/lazy-loading-modules' },
        { title: 'Execution context', url: '/fundamentals/execution-context' },
        { title: 'Lifecycle events', url: '/fundamentals/lifecycle-events' },
        { title: 'Discovery service', url: '/fundamentals/discovery-service' },
        { title: 'Platform agnosticism', url: '/fundamentals/platform-agnosticism' },
        { title: 'Testing', url: '/fundamentals/testing' },
      ],
    },
    {
      title: 'Techniques',
      url: '#',
      items: [
        { title: 'Configuration', url: '/techniques/configuration' },
        { title: 'Database', url: '/techniques/database' },
        { title: 'Mongo', url: '/techniques/mongodb' },
        { title: 'Validation', url: '/techniques/validation' },
        { title: 'Caching', url: '/techniques/caching' },
        { title: 'Serialization', url: '/techniques/serialization' },
        { title: 'Versioning', url: '/techniques/versioning' },
        { title: 'Task scheduling', url: '/techniques/task-scheduling' },
        { title: 'Queues', url: '/techniques/queues' },
        { title: 'Logging', url: '/techniques/logger' },
        { title: 'Cookies', url: '/techniques/cookies' },
        { title: 'Events', url: '/techniques/events' },
        { title: 'Compression', url: '/techniques/compression' },
        { title: 'File upload', url: '/techniques/file-upload' },
        { title: 'Streaming files', url: '/techniques/streaming-files' },
        { title: 'HTTP module', url: '/techniques/http-module' },
        { title: 'Session', url: '/techniques/session' },
        { title: 'Model-View-Controller', url: '/techniques/mvc' },
        { title: 'Performance (Fastify)', url: '/techniques/performance' },
        { title: 'Server-Sent Events', url: '/techniques/server-sent-events' },
      ],
    },
    {
      title: 'Security',
      url: '#',
      items: [
        { title: 'Authentication', url: '/security/authentication' },
        { title: 'Authorization', url: '/security/authorization' },
        { title: 'Encryption and Hashing', url: '/security/encryption-and-hashing' },
        { title: 'Helmet', url: '/security/helmet' },
        { title: 'CORS', url: '/security/cors' },
        { title: 'CSRF Protection', url: '/security/csrf' },
        { title: 'Rate limiting', url: '/security/rate-limiting' },
      ],
    },
    {
      title: 'GraphQL',
      url: '#',
      items: [
        { title: 'Quick start', url: '/graphql/quick-start' },
        { title: 'Resolvers', url: '/graphql/resolvers' },
        { title: 'Mutations', url: '/graphql/mutations' },
        { title: 'Subscriptions', url: '/graphql/subscriptions' },
        { title: 'Scalars', url: '/graphql/scalars' },
        { title: 'Directives', url: '/graphql/directives' },
        { title: 'Interfaces', url: '/graphql/interfaces' },
        { title: 'Unions and Enums', url: '/graphql/unions-and-enums' },
        { title: 'Field middleware', url: '/graphql/field-middleware' },
        { title: 'Mapped types', url: '/graphql/mapped-types' },
        { title: 'Plugins', url: '/graphql/plugins' },
        { title: 'Complexity', url: '/graphql/complexity' },
        { title: 'Extensions', url: '/graphql/extensions' },
        { title: 'CLI Plugin', url: '/graphql/cli-plugin' },
        { title: 'Generating SDL', url: '/graphql/generating-sdl' },
        { title: 'Sharing models', url: '/graphql/sharing-models' },
        { title: 'Other features', url: '/graphql/other-features' },
        { title: 'Federation', url: '/graphql/federation' },
      ],
    },
    {
      title: 'WebSockets',
      url: '#',
      items: [
        { title: 'Gateways', url: '/websockets/gateways' },
        { title: 'Exception filters', url: '/websockets/exception-filters' },
        { title: 'Pipes', url: '/websockets/pipes' },
        { title: 'Guards', url: '/websockets/guards' },
        { title: 'Interceptors', url: '/websockets/interceptors' },
        { title: 'Adapters', url: '/websockets/adapter' },
      ],
    },
    {
      title: 'Microservices',
      url: '#',
      items: [
        { title: 'Overview', url: '/microservices/basics' },
        { title: 'Redis', url: '/microservices/redis' },
        { title: 'MQTT', url: '/microservices/mqtt' },
        { title: 'NATS', url: '/microservices/nats' },
        { title: 'RabbitMQ', url: '/microservices/rabbitmq' },
        { title: 'Kafka', url: '/microservices/kafka' },
        { title: 'gRPC', url: '/microservices/grpc' },
        { title: 'Custom transporters', url: '/microservices/custom-transport' },
        { title: 'Exception filters', url: '/microservices/exception-filters' },
        { title: 'Pipes', url: '/microservices/pipes' },
        { title: 'Guards', url: '/microservices/guards' },
        { title: 'Interceptors', url: '/microservices/interceptors' },
      ],
    },
    {
      title: 'Deployment',
      url: '/deployment',
      items: [],
    },
    {
      title: 'Standalone apps',
      url: '/standalone-applications',
      items: [],
    },
    {
      title: 'CLI',
      url: '#',
      items: [
        { title: 'Overview', url: '/cli/overview' },
        { title: 'Workspaces', url: '/cli/monorepo' },
        { title: 'Libraries', url: '/cli/libraries' },
        { title: 'Usage', url: '/cli/usages' },
        { title: 'Scripts', url: '/cli/scripts' },
      ],
    },
    {
      title: 'OpenAPI',
      url: '#',
      items: [
        { title: 'Introduction', url: '/openapi/introduction' },
        { title: 'Types and Parameters', url: '/openapi/types-and-parameters' },
        { title: 'Operations', url: '/openapi/operations' },
        { title: 'Security', url: '/openapi/security' },
        { title: 'Mapped Types', url: '/openapi/mapped-types' },
        { title: 'Decorators', url: '/openapi/decorators' },
        { title: 'CLI Plugin', url: '/openapi/cli-plugin' },
        { title: 'Other features', url: '/openapi/other-features' },
      ],
    },
    {
      title: 'Recipes',
      url: '#',
      items: [
        { title: 'REPL', url: '/recipes/repl' },
        { title: 'CRUD generator', url: '/recipes/crud-generator' },
        { title: 'SWC (fast compiler)', url: '/recipes/swc' },
        { title: 'Passport (auth)', url: '/recipes/passport' },
        { title: 'Hot reload', url: '/recipes/hot-reload' },
        { title: 'MikroORM', url: '/recipes/mikroorm' },
        { title: 'TypeORM', url: '/recipes/sql-typeorm' },
        { title: 'Mongoose', url: '/recipes/mongodb' },
        { title: 'Sequelize', url: '/recipes/sql-sequelize' },
        { title: 'Router module', url: '/recipes/router-module' },
        { title: 'Swagger', url: '/recipes/swagger' },
        { title: 'Health checks', url: '/recipes/terminus' },
        { title: 'CQRS', url: '/recipes/cqrs' },
        { title: 'Compodoc', url: '/recipes/documentation' },
        { title: 'Prisma', url: '/recipes/prisma' },
        { title: 'Sentry', url: '/recipes/sentry' },
        { title: 'Serve static', url: '/recipes/serve-static' },
        { title: 'Commander', url: '/recipes/nest-commander' },
        { title: 'Async local storage', url: '/recipes/async-local-storage' },
        { title: 'Necord', url: '/recipes/necord' },
        { title: 'Suites (Automock)', url: '/recipes/suites' },
      ],
    },
    {
      title: 'FAQ',
      url: '#',
      items: [
        { title: 'Serverless', url: '/faq/serverless' },
        { title: 'HTTP adapter', url: '/faq/http-adapter' },
        { title: 'Keep-Alive connections', url: '/faq/keep-alive-connections' },
        { title: 'Global path prefix', url: '/faq/global-prefix' },
        { title: 'Raw body', url: '/faq/raw-body' },
        { title: 'Hybrid application', url: '/faq/hybrid-application' },
        { title: 'HTTPS & multiple servers', url: '/faq/multiple-servers' },
        { title: 'Request lifecycle', url: '/faq/request-lifecycle' },
        { title: 'Common errors', url: '/faq/common-errors' },
        { title: 'Examples', url: 'https://github.com/nestjs/nest/tree/master/sample' },
      ],
    },
    {
      title: 'Devtools',
      url: '#',
      items: [
        { title: 'Overview', url: '/devtools/overview' },
        { title: 'CI/CD integration', url: '/devtools/ci-cd-integration' },
      ],
    },
    {
      title: 'Migration guide',
      url: '/migration-guide',
      items: [],
    },
    {
      title: 'API Reference',
      url: 'https://api-references-nestjs.netlify.app/',
      items: [],
    },
    {
      title: 'Official courses',
      url: 'https://courses.nestjs.com/',
      items: [],
    },
    {
      title: 'Discover',
      url: '#',
      items: [
        { title: 'Who is using Nest?', url: '/discover/companies' },
        { title: 'Jobs board', url: 'https://jobs.nestjs.com/' },
      ],
    },
    {
      title: 'Support us',
      url: '/support',
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              { }
              <Link href="#">
                <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {(data.navMain as NavSection[]).map((item, index) => (
              <Collapsible
                key={item.title}
                className="group/collapsible"
                defaultOpen={index === 1}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}
                      {' '}
                      <Plus className="group-data-[state=open]/collapsible:hidden ml-auto" />
                      <Minus className="group-data-[state=closed]/collapsible:hidden ml-auto" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items.length
                    ? (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((item) => (
                              <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={item.isActive}
                                >
                                  <Link href={`/docs/${item.url}`}>{item.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )
                    : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
