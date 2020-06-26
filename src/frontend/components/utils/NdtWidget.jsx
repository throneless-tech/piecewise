// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material-ui imports
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

// module imports
import CircularProgressWithLabel from './CircularProgressWithLabel.jsx';
import NDTjs from '../../assets/js/ndt-browser-client.js';

const NDT_STATUS_LABELS = {
  preparing_s2c: 'Preparing download',
  preparing_c2s: 'Preparing upload',
  running_s2c: 'Measuring download speed',
  running_c2s: 'Measuring upload speed',
  finished_s2c: 'Finished download',
  finished_c2s: 'Finished upload',
  preparing_meta: 'Preparing metadata',
  running_meta: 'Sending metadata',
  finished_meta: 'Finished metadata',
  finished_all: 'Test complete',
};

class NdtHandler {
  constructor(callback) {
    this.cb = callback;
    this.state = undefined;
    this.time_switched = undefined;
  }

  event(msg, info) {
    console.debug(`EVENT: msg: ${msg}, info: ${info}`);
    this.cb(msg, info);
  }

  onstart() {
    this.event('Connecting...');
  }

  onstatechange(msg) {
    this.state = msg;
    this.time_switched = new Date().getTime();
    this.event(`${NDT_STATUS_LABELS[msg]}...`);
  }

  onprogress() {
    let progress_percentage;
    const time_in_progress = new Date().getTime() - this.time_switched;

    if (this.state === 'running_s2c' || this.state === 'running_c2s') {
      progress_percentage =
        time_in_progress < 10000 ? time_in_progress / 10000 : 1;
      const progress_label = NDT_STATUS_LABELS[this.state];
      this.event(progress_label, (progress_percentage * 100).toFixed(0));
    }
  }

  onfinish() {
    this.event(`${NDT_STATUS_LABELS[this.state]}`);
  }

  onerror(msg) {
    this.event(`Error: ${NDT_STATUS_LABELS[msg]}!`);
  }
}

function runNdt({
  server,
  port = '3010',
  protocol = 'wss',
  path = '/ndt_protocol',
  meter,
  updateInterval = 1000,
}) {
  const NDT_client = new NDTjs(
    server,
    port,
    protocol,
    path,
    meter,
    updateInterval,
  );

  NDT_client.startTest();
}

export default function NdtWidget(props) {
  // handle NDT test
  const { onFinish, locationConsent } = props;
  const [text, setText] = useState(null);
  const [progress, setProgress] = useState(null);
  const onProgress = (msg, percent) => {
    if (msg) setText(msg);
    if (percent) setProgress(percent);
  };

  const error = error => {
    window.alert(error.message);
  };

  const success = position => {
    document.getElementById('latitude-mlab').value = position.coords.latitude;
    document.getElementById('longitude-mlab').value = position.coords.longitude;
    document.getElementById('latitude').value = position.coords.latitude;
    document.getElementById('longitude').value = position.coords.longitude;

    var xhr = new XMLHttpRequest(),
      currentLocationURL =
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        position.coords.latitude +
        '&lon=' +
        position.coords.longitude +
        '&zoom=18&addressdetails=1';

    var currentLoc;
    xhr.open('GET', currentLocationURL, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          currentLoc = JSON.parse(xhr.responseText);
          console.log('Location received');
          // currentLocText.text(currentLoc.address.road + currentLoc.address.neighbourhood + currentLoc.address.suburb + currentLoc.address.city + currentLoc.address.state);
          document
            .getElementsByClassName('loader-item')[1]
            .append(
              'Searching from: ' +
                currentLoc.address.road +
                ', ' +
                currentLoc.address.city +
                ', ' +
                currentLoc.address.state,
            );
        } else {
          console.log('Location lookup failed');
        }
      }
    };
  };

  useEffect(() => {
    let mlabNsUrl;
    if (process.env.NODE_ENV === 'production') {
      console.info('In production mode, querying MLab NS.');
      mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';
    } else {
      console.info(
        'In development mode, proxying MLab NS request for CORS reasons.',
      );
      mlabNsUrl = '/api/v1/mlabns';
    }

    // if (locationConsent === 'yes') {
    //  if ('geolocation' in navigator) {
    //    navigator.geolocation.getCurrentPosition(success, error);
    //  }
    // }
    //
    // fetch(mlabNsUrl)
    //   .then(res => {
    //     console.debug('Raw response: ', res);
    //     if (res.status === 200) {
    //       return res.json();
    //     } else {
    //       throw new Error(`Error ${res.status}: ${res.statusText}`);
    //     }
    //   })
    //   .then(data => {
    //     console.debug('Received response from MLab NS: ', data);
    //     //const meter = new NDTmeter(selector);
    //     const meter = new NdtHandler(onProgress, onFinish);
    //     runNdt({ server: data.fqdn, meter: meter });
    //     return data;
    //   })
    //   .catch(err => {
    //     console.error('M-Lab NS lookup failed: ', err.message);
    //     window.alert('M-Lab NS lookup failed. Please refresh the page.');
    //   });
  }, []);

  return (
    <Container>
      <CircularProgressWithLabel value={progress} />
      <Typography>{text}</Typography>
    </Container>
  );
}

NdtWidget.propTypes = {
  onFinish: PropTypes.func,
  locationConsent: PropTypes.string.isRequired,
};
