import { Route } from "@angular/router"
import { CollectivePersonFormComponent } from "./ui/collective-person-form/collective-person-form.component"

const CollectivePersonFormRoutes: Route[] = [
    {
      path: 'collective-Person',
      children: [
        {
          path: '',
          component: CollectivePersonFormComponent
        }
      ]
      
    }
  ]

export default CollectivePersonFormRoutes
