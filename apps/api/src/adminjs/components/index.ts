type ComponentLoaderLike = {
  add: (name: string, filePath: string) => string;
  override: (name: string, filePath: string) => string;
};

type ComponentLoaderConstructor = new () => ComponentLoaderLike;

export const createAdminJsComponents = (ComponentLoader: ComponentLoaderConstructor) => {
  const componentLoader = new ComponentLoader();

  return {
    componentLoader,
    Components: {
      Dashboard: componentLoader.add('Dashboard', './Dashboard'),
      SellerMap: componentLoader.add('SellerMap', './SellerMap'),
      SellerAnalytics: componentLoader.add('SellerAnalytics', './SellerAnalytics'),
      AuditTimeline: componentLoader.add('AuditTimeline', './AuditTimeline'),
      TopBar: componentLoader.override('TopBar', './TopBar'),
      SidebarBranding: componentLoader.override('SidebarBranding', './SidebarBranding'),
      SidebarPages: componentLoader.override('SidebarPages', './SidebarPages'),
    },
  };
};
