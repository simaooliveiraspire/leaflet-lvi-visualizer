window.addEventListener("load", function(){
  if(window.location.href.includes('mmsi=') && window.location.href.includes('key=') ){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const mmsi=urlParams.getAll('mmsi')[0];
    const key=urlParams.getAll('key')[0];
    if(mmsi.length==9) initMap(mmsi, key);
    else alert('Invalid mmsi provided.');
  }else{
    alert('Please provide a valid mmsi and key');
  }
});

function initMap(mmsi, key) {
  const map = L.map('map', {
    center:[20, 0],
    zoom:3,
    minZoom: 2,
    scrollWheelZoom:true,
    layers:[L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    zoomControl:true,
    doubleClickZoom:true,
    dragging:true
  });

  fetch('https://services.exactearth.com/gws/wfs?authKey='+key+'&service=WFS&request=GetFeature&version=1.1.0&typeName=exactAIS:LVI&outputFormat=json&cql_filter=mmsi='+mmsi)
  .then(function(response) {
    if(response.statusText!=='Unauthorized') return response.json();
    else alert('Invalid key provided');
  })
  .then(function(myJson) {
   // console.log(myJson);
    if(typeof myJson.features!=='undefined' && myJson.features.length){
      const position=myJson.features[0].geometry;
      const heading=myJson.features[0].properties.heading ? myJson.features[0].properties.heading : 0;
      const marker=L.geoJSON(position, {
        pointToLayer: function(f, latlng) {
          vesselIcon=new L.divIcon({className: 'boatIcon', iconSize:[16,30], iconAnchor:[8,15]});
          return L.marker(latlng, {icon: vesselIcon, rotationAngle:heading});
        }
      }).addTo(map);

      map.setView([myJson.features[0].properties.latitude, myJson.features[0].properties.longitude], 6);
      document.getElementById('map').classList.remove('loading');
    }else{
      alert('No vessel with mmsi '+parseInt(mmsi));
      document.getElementById('map').classList.remove('loading');
    }
  });
}