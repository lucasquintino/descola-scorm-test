import api from '../../../api/api'

//function to sort the sources
export const orderFunction = (a, b) => {
  const itemA = Number(a.label.replace('p', ''));
  const itemB = Number(b.label.replace('p', ''));
  if (itemA > itemB) {
    return -1;
  }
  if (itemA < itemB) {
    return 1;
  }
  return 0;
};

//function to select the resolution
export const selectQuality = (bandwidth, resolutions) => {
  if (bandwidth > 9) return resolutions[0];
  if (bandwidth <= 9 && bandwidth > 5) return '720p';
  if (bandwidth <= 5 && bandwidth > 3) return resolutions.includes('540p') ? '540p' : '480p';
  if (bandwidth <= 3 && bandwidth > 1.3) return '360p';
  if (bandwidth <= 1.3) {
    return resolutions[resolutions.length - 1];
  }
};

//function to define the connection according to the browser
export const connectionSpeed = connection => {
  var defaultSpeed = false;

  if (!connection) return defaultSpeed;

  if ('downlink' in connection) {
    var downlink = connection.downlink;
    if (!downlink) return defaultSpeed;
    if (!isFinite(downlink)) return defaultSpeed;
    return downlink;
  }

  if ('bandwidth' in connection) {
    var bandwidth = connection.bandwidth;
    if (!bandwidth) return defaultSpeed;
    if (isNaN(bandwidth)) return defaultSpeed;
    return bandwidth;
  }

  switch (connection.type) {
    case 'none':
      return 0;
    case '2g':
      return 0.4;
    case 'bluetooth':
    case 'cellular':
      return 2;
    case '3g':
      return 1.4;
    case '4g':
      return 8;
    case 'ethernet':
      return 10;
    case 'wifi':
      return 10;
    default:
      return 1.4;
  }
};

//function to select which source will be used
export const getSources = data => {
  const mp4Files = data.filter(item => item.type_name !== 'source' && item.quality !== 'stream');
  const streamFiles = data.filter(item => item.quality === 'stream');

  const mp4sources = mp4Files.map(item => {
    return { src: item.url, label: item.quality, type: 'video/mp4', res: item.height };
  });
  const streamSources = streamFiles.map(item => {
    return { src: item.url, type: 'application/x-mpegURL', type_name: item.type_name };
  });

  const hlsStream = streamSources.find(item => item.type_name === 'hls');
  const hlsfmp4Stream = streamSources.find(item => item.type_name === 'hlsfmp4');
  const dashStream = streamSources.find(item => item.type_name === 'dash');
  const orderSrc = mp4sources.sort((a, b) => orderFunction(a, b));

  return { mp4sources: orderSrc, streamSources: hlsfmp4Stream || hlsStream || dashStream || null };
};

//function to add authentication to requests made by the player
export const interceptRequest = vhs => {
  if (vhs)
    vhs.xhr.beforeRequest = function(options) {
      const isKeyEndpoint = !options.uri.includes('cdn.descola.org');
      if (isKeyEndpoint) {
        options.headers = {
          'Authorization': api.defaults.headers.common['Authorization']
        };
      }
      return options;
    };
};
