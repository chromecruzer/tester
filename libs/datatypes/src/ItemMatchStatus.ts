export default class ItemMatchStatus {
  constructor() {
  }
  match(location_code, candidate) {
    switch(true) {
      case location_code === candidate.customer_id:
        return 'True Match';
      default:
        return 'Found In Other Location';
    }
  }
}
