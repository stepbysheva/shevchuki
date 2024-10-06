import {SnackbarContent} from "@mui/material";
import {styled} from "@mui/material/styles";

const CustomSnackbarContent = styled(SnackbarContent)(({ theme, variant }) => ({
  backgroundColor: 'white',
  color: 'grey',
  border: '2px solid lightgrey',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center', // Ensures text is centered
}));

export default CustomSnackbarContent;