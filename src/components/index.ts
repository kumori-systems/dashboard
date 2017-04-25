// Layouts
import AppMain from './layout/AppMain.vue';
import FooterBar from './layout/FooterBar.vue';
import NavBar from './layout/NavBar.vue';
import SideBar from './layout/SideBar.vue';

// Views
import Overview from './views/Overview.vue';
import Deployments from './views/Deployments.vue';
import Storage from './views/Storage.vue';
import WebDomains from './views/WebDomains.vue';
import DataVolumes from './views/DataVolumes.vue';
import AlarmsAndLogs from './views/AlarmsAndLogs.vue';
import Help from './views/Help.vue';

// Inner components
import DeploymentCard from './innerComponents/DeploymentCard.vue';


// Export layouts
export {AppMain, FooterBar, NavBar, SideBar};

// Export views
export { Overview, Deployments, Storage, WebDomains, DataVolumes, AlarmsAndLogs, Help };

// Export inner components
export{ DeploymentCard };