import { Injectable } from '@angular/core';
import {catchError, map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable(
  {providedIn: "root"}
)
export class MapsService {

  apiLoaded: Observable<boolean>;

  constructor(httpClient: HttpClient) {
    // If you're using the `<map-heatmap-layer>` directive, you also have to include the `visualization` library
    // when loading the Google Maps API. To do so, you can add `&libraries=visualization` to the script URL:
    // https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization

    this.apiLoaded = httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.mapsKey}`, 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }
}
