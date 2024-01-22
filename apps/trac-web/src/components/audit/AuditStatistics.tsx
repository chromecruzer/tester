import React, {useMemo} from "react";
import _ from "lodash";
import {ExpirationCalculations} from "@trac/datatypes";

export const AuditStatistics = ({auditItems}) => {
  const statistics = useMemo(() => {
    return _.groupBy(auditItems, i => i.audit_match);
  }, [auditItems]);
  const expireCalculations = useMemo(() => {
    const calcs = new ExpirationCalculations();
    return {
      'True Match': calcs.filterExpired(statistics['True Match']),
      'Billed': calcs.filterExpired(statistics['Billed']),
      'Found In Other Location': calcs.filterExpired(statistics['Found In Other Location']),
      'Missing': calcs.filterExpired(statistics['Missing']),
      'Other': calcs.filterExpired(statistics['Other']),
    }
  }, [statistics]);
  // console.log('statistics', statistics);
  const statsDisplay = (stats)  => {
    if(_.isArray(stats)) {
      return stats.length;
    }
    return 0;
  }
  // console.log('expire statistics', expireCalculations);
  return <div className='flex-col'>
    <div className='flex justify-start items-start'>
      <h4 className='py-2 px-1'>True Matches: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['True Match'])}</span>
      <h4 className='py-2 px-1'>Billed: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['Billed'])}</span>
      <h4 className='py-2 px-1'>Found In Other Location: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['Found In Other Location'])}</span>
      <h4 className='py-2 px-1'>Non Matches: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['No Match'])}</span>
      <h4 className='py-2 px-1'>Missing: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['Missing'])}</span>
      <h4 className='py-2 px-1'>Other: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(statistics['Other'])}</span>
    </div>
    <div className='flex justify-start items-start'>
      <h4 className='py-2 px-1'>Expired True Matches: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(expireCalculations['True Match'])}</span>
      <h4 className='py-2 px-1'>Expired Billed: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(expireCalculations['Billed'])}</span>
      <h4 className='py-2 px-1'>Expired Found In Other Location: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(expireCalculations['Found In Other Location'])}</span>
      <h4 className='py-2 px-1'>Expired Missing: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(expireCalculations['Missing'])}</span>
      <h4 className='py-2 px-1'>Expired Other: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{statsDisplay(expireCalculations['Other'])}</span>
    </div>
  </div>
}
