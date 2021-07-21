import AddIcon from "@material-ui/icons/Add";
import ListIcon from "@material-ui/icons/List";
import bellFill from "@iconify/icons-eva/bell-fill";
import { Icon } from "@iconify/react";

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
    {
        subheader: "home",
        items: [
            {
                title: "My Stryncs",
                path: "/",
                icon: <ListIcon />,
            },
            {
                title: "Create",
                path: "/create",
                icon: <AddIcon />,
            },
            {
                title: "Notifications",
                path: "/notifications",
                icon: getIcon(bellFill),
            },
        ],
    },
];

export default sidebarConfig;
