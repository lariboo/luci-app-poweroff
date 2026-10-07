module("luci.controller.poweroff", package.seeall)

function index()
	-- 若系统支持 JSON 菜单 (新版 LuCI)，则交给 menu.d，避免菜单重复
	local fs = require "nixio.fs"
	if fs.access("/usr/share/luci/menu.d/luci-base.json") then
		return
	end

	entry({"admin", "system", "poweroff"}, template("poweroff/poweroff"), _("Power Off"), 91)
	entry({"admin", "system", "poweroff", "call"}, post("action_poweroff"))
end

function action_poweroff()
	luci.template.render("poweroff/poweroff_done")
	-- 延迟执行，确保页面先返回给浏览器
	luci.sys.call("(sleep 3; /sbin/poweroff) >/dev/null 2>&1 &")
end
