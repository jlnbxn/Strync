import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useList } from "react-firebase-hooks/database";
import { Icon } from "@iconify/react";
import bellFill from "@iconify/icons-eva/bell-fill";
import clockFill from "@iconify/icons-eva/clock-fill";
import doneAllFill from "@iconify/icons-eva/done-all-fill";
import { alpha } from "@material-ui/core/styles";
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import MenuPopover from "./MenuPopover";
import { FirebaseContext } from "../../contexts/FirebaseContext";


function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography
        component="span"
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  if (notification.type === "failed") {
    return {
      avatar: <CancelIcon color="error" />,
      title,
    };
  }
}

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
};

function NotificationItem({ notification }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItem
      button
      to="#"
      disableGutters
      component={RouterLink}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: "1px",
        ...(notification.isUnRead && {
          bgcolor: "action.selected",
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              color: "text.disabled",
            }}
          >
            {/* <Box
              component={Icon}
              icon={clockFill}
              sx={{ mr: 0.5, width: 16, height: 16 }}
            /> */}
            {notification.createdAt}
          </Typography>
        }
      />
    </ListItem>
  );
}

export default function NotificationsPopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { state, dispatch } = useContext(FirebaseContext);
  const { auth, firebase } = state;
  const [snapshots, loading, error] = useList(
    firebase
      .database()
      .ref("users/" + auth.currentUser.uid + "/" + "notifications")
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    const snapshot = await firebase
      .database()
      .ref("users/" + auth.currentUser.uid + "/" + "notifications")
      .once("value")
      .then((snapshot) => snapshot);

    snapshot.ref.remove();
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        color={open ? "primary" : "default"}
        sx={{
          ...(open && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.focusOpacity
              ),
          }),
        }}
      >
        <Badge badgeContent={snapshots.length} color="error">
          <Icon icon={bellFill} width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 360 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have {snapshots.length} unread Notifications
            </Typography>
          </Box>

          {snapshots.length > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Icon icon={doneAllFill} width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        <Box sx={{ height: { xs: 340, sm: "auto" } }}>
          <List
            disablePadding
          // subheader={
          //   <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
          //     New
          //   </ListSubheader>
          // }
          >
            {snapshots.slice(0, 2).map((v) => (
              <NotificationItem key={v.key} notification={v.val()} />
            ))}
            {/* {notifications && notifications.slice(0, 2).map((notification, index) => (
              <NotificationItem key={index} notification={notification} />
            ))} */}
          </List>

          {/* <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List> */}
        </Box>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            disableRipple
            component={RouterLink}
            to="/notifications"
          >
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
