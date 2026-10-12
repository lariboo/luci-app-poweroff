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
		/* 使用浏览器原生确认框，与重启页保持一致；两行文字显示在同一个对话框内 */
		if (!confirm(_('Physical access is required to turn it on again. Press the power button or reconnect the power.') + '\n' + _('Are you sure you want to power off the device?')))
			return;

		return this.doPoweroff();
	},

	render: function() {
		return E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('poweroff/poweroff.css') }),
			E('h2', _('Power Off')),
			E('div', { 'class': 'cbi-map-descr' },
				_('Power off the device (soft shutdown)')),
			E('div', { 'class': 'po-card' }, [
				E('button', {
					'class': 'po-btn',
					'type': 'button',
					'title': _('Perform power off'),
					'aria-label': _('Perform power off'),
					'click': L.bind(this.confirmPoweroff, this)
				}),
				E('div', { 'class': 'po-title' }, _('Perform power off'))
			])
		]);
	}
});
