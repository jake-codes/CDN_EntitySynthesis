# Api Test Monitor for NR Entity: ext-cdn_generic

This script creates new CDN custom events in New Relic  for the generic cdn [entity synthesis](https://github.com/newrelic-experimental/entity-synthesis-definitions/tree/main/definitions). It creates these CDN events from SyntheticRequest URL's that contain the string 'cdn'.


## Requirements
You must have existing Synthetic Monitors that hit cdn's. More specifically, you must have SyntheticRequest's in New Relic that contain the string 'cdn'. 

## Usage
Copy this script into a Synthetic API Test Monitor and make sure there are existing SyntheticRequests.

The api test monitor can be run at any frequency, but the `MONITOR_FREQUENCY_IN_MINUTES` variable in the script must be set to the same frequency so that duplicates do not occur.

## Future Improvemnts
- Include Browser and Mobile requests
- Make logic that avoids duplicates more robust



## Support
You can email jneal@newrelic.com for more information.
