import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'
import { resp } from './common/utils/response.util'
import { APP_API_CONFIG } from './config/documentation/api-operations.config'
import { ApiDocs } from './config/documentation/decorators/api-docs.decorator'
import { Public } from './modules/auth/decorators/public.decorator'

@ApiTags('应用信息')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiDocs(APP_API_CONFIG.root)
  root() {
    return resp({
      data: this.appService.getHello(),
    })
  }
}
