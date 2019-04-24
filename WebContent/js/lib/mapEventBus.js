var _MapEvents = {};

_MapEvents.map_loaded = 'map_loaded';   // 지도가 로딩된 후 호출됨
_MapEvents.map_moveend = 'map_moveend';   // 지도 이동후
_MapEvents.map_singleclick = 'map_singleclick';   // 지도 클릭
_MapEvents.change_layerGroup = 'change_layerGroup';
_MapEvents.change_size = 'change_size';
_MapEvents.change_target = 'change_target';
_MapEvents.change_view = 'change_view';
_MapEvents.map_clicked = 'map_clicked';
_MapEvents.map_dblclick = 'map_dblclick';

_MapEvents.map_addLayer = 'map_addLayer';
_MapEvents.map_removeLayer = 'map_removeLayer';

_MapEvents.map_pointermove = 'map_pointermove';
_MapEvents.map_mousemove = 'map_mousemove';

_MapEvents.map_move = 'map_move';
_MapEvents.show_odorSpread_layer = 'show_odorSpread_layer';
_MapEvents.hide_odorSpread_layer = 'hide_odorSpread_layer';
_MapEvents.show_odorMovement_layer = 'show_odorMovement_layer';
_MapEvents.hide_odorMovement_layer = 'hide_odorMovement_layer';


_MapEvents.task_mode_changed = 'task_mode_changed';
_MapEvents.onresizeall_end = 'onresizeall_end';

_MapEvents.setZoom = 'setzoom';

_MapEvents.clickLayerOnOff = 'clickLayerOnOff';

_MapEvents.addWriteLayerForUseGeoserver = 'addWriteLayerForUseGeoserver';
_MapEvents.map_removeLayerByName = 'mapRemoveLayerByName';

_MapEvents.init = 'init';

_MapEvents.complaintStatusMode = 'complaintStatusMode';
_MapEvents.chartMode = 'chartMode';
_MapEvents.getChartData = 'getChartData';
_MapEvents.getChartFeature = 'getChartFeature';
_MapEvents.writeChart = 'writeChart';

_MapEvents.setCurrentDate = 'setCurrentDate';

_MapEvents.alertShow = 'alertShow';
_MapEvents.show_cvplPopup = 'show_cvplPopup';
_MapEvents.hide_cvplPopup = 'hide_cvplPopup';

_MapEvents.write_bottom_grid_tab = 'write_bottom_grid_tab';
_MapEvents.clear_bottom_grid_tab = 'clear_bottom_grid_tab';

_MapEvents.addWriteLayerForBiz = 'addWriteLayerForBiz';

_MapEvents.initFeatureLayer = 'initFeatureLayer';
_MapEvents.layerLoaded = 'layerLoaded';

_MapEvents.map_addOverlay = 'map_addOverlay';
_MapEvents.map_removeOverlay = 'map_removeOverlay';



var _MapEventBus = $({});

// sample 
/*
_MapEventBus.on(_MapEvents.map_loaded, function(event, data){
	console.log('map_loaded', event, data);
});

_MapEventBus.trigger(_MapEvents.map_loaded, {result:'sampleData'});

*/
