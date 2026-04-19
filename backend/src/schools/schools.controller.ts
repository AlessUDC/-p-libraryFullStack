import { Controller, Get, Query } from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findByFaculty(@Query('facultyId') facultyId: string) {
    return this.schoolsService.findByFaculty(facultyId);
  }
}
