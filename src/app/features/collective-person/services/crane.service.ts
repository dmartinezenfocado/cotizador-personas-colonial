import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../../core/data/services/base-crud.service";
import { Crane } from "../../../core/data/models/crane.model";

@Injectable()
export class CraneService extends BaseCrudService<Crane> {
    controller = 'Cranes';
}