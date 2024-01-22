export class BatchEdit {
  protected uuids: string[];
  constructor() {
    this.uuids = [];
  }
  public setSelectedUuids(uuids) {
    // console.log('selected uuids for the batch edits', uuids);
    this.uuids = [...uuids];
  }
}
