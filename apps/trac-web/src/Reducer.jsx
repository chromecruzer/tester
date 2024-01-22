const Reducer = (state, action) => {
  // console.log('IN REDUCER: ', action);
  // Generally we're going to spread the current state and add to it.
  switch (action.type) {
    case 'SET-APP-USER':
      return {...state, appUser: action.appUser};
    case 'SET-ACTIVE':
      return {...state, activePage: action.activePage};
    case 'SET-DOWNLOAD-PORT':
      return {...state, serverPort: action.serverPort};
    case 'SET-TERRITORIES-AND-ROLES':
      const data = action.territoriesAndRoles;
      // Get areas
      const ASD = data.filter(({role}) => role === 'ASD').sort((a, b) => (a.territory_id > b.territory_id) ? 1 : (a.territory_id < b.territory_id) ? -1 : 0);
      // Map regions to areas while mapping territories to regions.
      ASD.forEach(asd => {
        const RBD = data.filter(({role, reports_to}) => role === 'RBD' && reports_to === asd.territory_id);
        RBD.forEach(rbd => {
          rbd.territories = data.filter(({reports_to}) => reports_to === rbd.territory_id);
        })
        asd.regions = RBD;
      });
      return {...state, territoriesAndRoles: ASD, trRaw: data};
    case 'CUSTOMER':
      return {...state, customer: action.customer};
    case 'STM':
      return {...state, STM: action.STM};
    case 'NOTIFICATION':
      return {...state, notification: action.notification};
    case 'OPEN-DIALOG': // FIXME: Actually use dispatched property.
      return {...state, show: true};
    default:
      return state;
  }
};

export default Reducer;
