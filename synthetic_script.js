/**
 * Feel free to explore, or check out the full documentation
 * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-api-tests
 * for details.
 */

const QUERY_KEY = `${$secure.RELI_HACK_QUERY_KEY}`;
const INSERT_KEY = `${$secure.RELI_INGEST_KEY}`;
const MONITOR_FREQUENCY_IN_MINUTES = '5';
const ACCOUNT_ID = 1822040;

const assert = require('assert');
const Q = require('q');


const getCDNRequests = function () {
  let deferred = Q.defer();
  // In the future, we could check for CDN requests made via the Browser or Mobile agents as well.
  // const NRQL_CDNs_via_SyntheticRequests = `SELECT * FROM SyntheticRequest WHERE url LIKE '%cdn%' LIMIT MAX`;
  const NRQL_CDNs_via_SyntheticRequests = "SELECT * FROM SyntheticRequest WHERE URL like '%cdn%' LIMIT MAX SINCE " + MONITOR_FREQUENCY_IN_MINUTES + " MINUTES AGO";
  // const nrqlQueryInGraphQL = `{ actor { account(id: ${ACCOUNT_ID}) { nrql(query: "${NRQL_CDNs_via_SyntheticRequests}") { results } }}}`;
  // const queryString = JSON.stringify({"query": nrqlQueryInGraphQL});
  const queryString = encodeURI(NRQL_CDNs_via_SyntheticRequests)
  const uri = 'https://insights-api.newrelic.com/v1/accounts/'+ACCOUNT_ID+'/query?nrql='+queryString;
  // console.log('uri: ', uri);
  const options = {
    //Define endpoint URI
    uri: uri,
    //Define query key and expected data type.
    headers: {
      'X-Query-Key': QUERY_KEY,
      'Accept': 'application/json',
    }
  };
  $http.get(options,
    // Callback
    function (err, response, body) {
      if (response.statusCode == 200) {
        deferred.resolve(body);
      } else {
        console.error('Expected a 200 response when querying events.', response.statusCode)
        deferred.reject(response);
      }
    }
  );
  return deferred.promise;
}

let resultArray = ''
const createCDNEvents = function(body) {
  let deferred = Q.defer();
  let cdnEvents = [];
  try {
    // console.log("attempting to parse body into JSON:", body);
    const json_body = JSON.parse(body)
    resultArray = json_body['results'][0]['events'];
    for (let i = 0; i < resultArray.length; i++) {
      const event = {
        eventType: 'CDN',
        cdn_url: resultArray[i]['URL'],
        domain: resultArray[i]['domain'],
        host: resultArray[i]['host'],
        duration: resultArray[i]['duration'],
        monitorName: resultArray[i]['monitorName'],
        responseBodySize: resultArray[i]['responseBodySize'],
        responseCode: resultArray[i]['responseCode']

      }
      cdnEvents.push(event);
    }
    deferred.resolve(cdnEvents);
  } catch (err) {
    console.error('Result array before createCDNEvents error', resultArray)
    deferred.reject(err);
  }
  return deferred.promise;
}

const postNewCDNRequests = function(cdnEvents) {
  let deferred = Q.defer();
  // console.log('cdnEvents', cdnEvents)
  const options = {
    //Define endpoint URL.
    url: "https://insights-collector.newrelic.com/v1/accounts/"+ACCOUNT_ID+"/events",
    //Define body of POST request.
    body: JSON.stringify(cdnEvents),
    //Define insert key and expected data type.
    headers: {
        'X-Insert-Key': INSERT_KEY,
        'Content-Type': 'application/json'
        }
  };
  $http.post(options,
    // Callback
    function (err, response, body) {
      if (response.statusCode == 200) {
        console.log('Successful post!')
        deferred.resolve(body);
      } else {
        console.error('Expected a 200 response when posting new event data', response.statusCode)
        deferred.reject(response);
      }
    }
  );
  return deferred.promise;
}

// Execute promise chain
getCDNRequests().then((body) => createCDNEvents(body)).then((cdnEvents) => postNewCDNRequests(cdnEvents));
