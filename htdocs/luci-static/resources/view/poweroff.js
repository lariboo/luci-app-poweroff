'use strict';
'require view';
'require fs';
'require ui';

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,

	doPoweroff: function() {
		ui.showModal(_('Power Off'), [
			E('p', { 'class': 'spinning' }, _('The device is shutting down. You can unplug the power once the LEDs turn off.'))
		]);

		/* 连接会随设备关机而中断，因此忽略返回/错误 */
		return fs.exec('/sbin/poweroff').catch(function() {});
	},

	confirmPoweroff: function() {
		ui.showModal(_('Confirm'), [
			E('p', _('Are you sure you want to power off the device?')),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': ui.hideModal }, _('Cancel')),
				' ',
				E('button', {
					'class': 'btn cbi-button cbi-button-negative important',
					'click': ui.createHandlerFn(this, 'doPoweroff')
				}, _('Power Off'))
			])
		]);
	},

	render: function() {
		return E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('poweroff/poweroff.css') }),
			E('h2', _('Power Off')),
			E('div', { 'class': 'cbi-map-descr' },
				_('Shut down the device. Physical access is required to turn it on again.')),
			E('div', { 'class': 'po-card' }, [
				E('button', {
					'class': 'po-btn',
					'type': 'button',
					'title': _('Perform power off'),
					'aria-label': _('Perform power off'),
					'click': ui.createHandlerFn(this, 'confirmPoweroff')
				}),
				E('div', { 'class': 'po-title' }, _('Perform power off')),
				E('p', { 'class': 'po-desc' }, _('Shut down the device. Physical access is required to turn it on again.'))
			])
		]);
	}
});
