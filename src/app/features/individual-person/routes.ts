import { Route } from "@angular/router"
import { IndividualPersonFormComponent } from "./ui/individual-person-form/individual-person-form.component"


const individualPersonFormRoutes: Route[] = [
    {
      path: 'individual-person',
      children: [
        {
          path: '',
          component: IndividualPersonFormComponent
        }
      ]
    }
  ]

export default individualPersonFormRoutes
