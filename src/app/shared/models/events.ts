export class Events {
  eventName: string;
  eventDesc: string;
  eventStartDate: string;
  eventEndDate: string;
  eventBanner: string;
  eventVenue: string;
  uid: string;
  id: string;
  imagePath!: string;
  registered!: string[];

  constructor(
    eventName: string,
    eventDesc: string,
    eventStartDate: string,
    eventEndDate: string,
    eventBanner: string,
    eventVenue: string,
    uid: string,
    id?: string,
    registered?: string[],
  ) {
    this.eventName = eventName;
    this.eventDesc = eventDesc;
    this.eventStartDate = eventStartDate;
    this.eventEndDate = eventEndDate;
    this.eventBanner = eventBanner;
    this.eventVenue = eventVenue;
    this.uid = uid;
    this.id = id!;
    this.registered = registered!;
  }
}
