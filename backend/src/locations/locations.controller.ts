import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provinces')
  findAllProvinces() {
    return this.locationsService.findAllProvinces();
  }

  @Get('districts')
  findDistrictsByProvince(@Query('provinceId') provinceId: string) {
    return this.locationsService.findDistrictsByProvince(provinceId);
  }
}
