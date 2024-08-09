import Alert from "react-bootstrap/Alert";
import PropTypes from "prop-types";
import "../stylesheets/alert.css";

const AlertDismissibleExample = ({ message, onClose }) => {
  return (
    <div className="alert-container">
      <Alert variant="danger" dismissible onClose={onClose}>
        <Alert.Heading>{message}</Alert.Heading>
      </Alert>
    </div>
  );
};

AlertDismissibleExample.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlertDismissibleExample;
