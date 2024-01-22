import Chance from 'chance';
const chance = new Chance();
const generateExpired = num => ({
  uuid: `uuid${num}`,
  customer_id: `0${1234927 + num}`,
  item: `MXUT500+${325+num}`,
  description: `MXUT500 12.5MM +${chance.integer({min:12, max: 30})}.${chance.pickone('00', '50')}`,
  description4: null,
  description5: null,
  lot: `396200${8001 + num}`,
  quantity: 1,
  expire_date: `7/${chance.integer({min: 1, max: 31})}/2022`,
  prod_uuid: `prod-uuid${num}`,
  product_id: 'product id'
});
const generateMissing = num => ({
  uuid: `uuid${num}`,
  lot: `396200${8001 + num}`,
  item: `MXUT500+${325+num}`,
  consignment_uuid: `consignmentuuid${num}`,
  consignment_location: `0${1234927 + num}`,
  family: 'FAMILY',
  description: `MXUT500 12.5MM +${chance.integer({min:12, max: 30})}.${chance.pickone('00', '50')}`,
  expire_date: `7/${chance.integer({min: 1, max: 31})}/2022`,
  audit_match: 'Missing',
  quantity: 1,
  last_changed_date: `8/${chance.integer({min: 1, max: 31})}/2022`
});
export default class GenerateConsignmentData {
  constructor(private type) {
  }
  generate(size) {
    const result = [];
    const gen = this.type === 'expired' ? generateExpired : generateMissing;
    for(let r = 0; r < size; r++) {
      result.push(gen(r));
    }
    return result;
  }
}
