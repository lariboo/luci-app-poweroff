'use strict';
'require view';
'require fs';
'require ui';

/* 关机后等待多少秒再断电（如接有 USB 硬盘或为 x86，建议改为 30） */
var SHUTDOWN_WAIT = 15;

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,

	doPoweroff: function() {
		var end = Date.now() + SHUTDOWN_WAIT * 1000;

		var tip = E('p', { 'class': 'spinning' },
			_('The device is shutting down'));
		var num = E('div', { 'class': 'po-countdown' }, String(SHUTDOWN_WAIT));
		var hint = E('p', { 'class': 'po-hint' },
			_('Please wait for the countdown to finish before unplugging'));

		ui.showModal(_('Power Off'), [ tip, num, hint ]);

		/* 用时间差计算，息屏或页面被节流时也不会走慢 */
		var timer = window.setInterval(function() {
			var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
			num.textContent = String(left);

			if (left <= 0) {
				window.clearInterval(timer);
				tip.classList.remove('spinning');
				num.classList.add('done');
				num.textContent = _('Safe to unplug');
				hint.style.display = 'none';
			}
		}, 250);

		/* 连接会随设备关机而中断，因此忽略网络错误；仅在命令明确失败时提示 */
		return fs.exec('/sbin/poweroff').then(function(res) {
			if (res && typeof res.code === 'number' && res.code !== 0) {
				window.clearInterval(timer);
				ui.hideModal();
				ui.addNotification(null, E('p', _('Failed to execute power off command.')), 'danger');
			}
		}).catch(function() {});
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
				E('div', { 'class': 'po-title' }, _('Perform power off'))
			])
		]);
	}
});
