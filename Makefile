include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for Power Off
LUCI_DEPENDS:=
LUCI_PKGARCH:=all

PKG_VERSION:=1.0
PKG_RELEASE:=3
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=

include $(TOPDIR)/feeds/luci/luci.mk
# call BuildPackage - OpenWrt buildroot signature
