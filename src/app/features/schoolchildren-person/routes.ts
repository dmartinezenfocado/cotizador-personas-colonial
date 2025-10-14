import { Route } from "@angular/router"
import { SchoolChildrenPersonFormComponent } from "./ui/schoolchidren-person-form/schoolchildren-person-form.component"



const SchoolChildrenPersonRoutes: Route[] = [
    {
      path: '',
      children: [
        {
          path: '',
          component: SchoolChildrenPersonFormComponent
        }
      ]
      
    }
  ]

export default SchoolChildrenPersonRoutes
