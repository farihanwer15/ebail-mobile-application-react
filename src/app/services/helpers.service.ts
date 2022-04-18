import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  getTimeZoneName(timezone) {

    switch (timezone) {
      case '-0500':
        return 'America/New_York'
      case '-0600':
        return 'America/Chicago'
      case '-0700':
        return 'America/Denver'
      case '-0800':
        return 'America/Los_Angeles'
      case '-0900':
        return 'America/Anchorage'
      case '-1000':
        return 'America/Adak'
    }
  }

  getFormattedDate(date, format, timezone) {
    const zoneName = this.getTimeZoneName(timezone);
    return moment.tz(date, zoneName).format(format);
  }
}
