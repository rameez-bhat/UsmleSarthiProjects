import { styled } from '@mui/system';
import Button from '@mui/material/Button';
import { Tabs, Tab, Box } from '@mui/material';
import theme2 from './theme';
console.log("theme--->",theme2)
const CrystalButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  backdropFilter: 'blur(10px)', // Add a blur effect
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent background
});

const ColoredTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,

}));

const ColoredTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme2.typography.fontWeightRegular,
  fontSize: theme2.typography.pxToRem(15),
  marginRight: theme2.spacing(1),
  '&.Mui-selected': {
    color: '#ffffff',
    backgroundColor: theme2.palette.primary.main,
    borderRadius: '4px',
  },
  '&:not(.Mui-selected)': {
    color: theme2.palette.text.primary,
    backgroundColor: theme2.palette.background.paper,
  },
}));

const CenteredBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  //height: '100vh',
  flexDirection: 'column',
  backgroundColor: theme2.palette.background.default,
  padding: theme2.spacing(2),
}));
const CenteredBoxInfo = styled(Box)(({ theme }) => ({

  height: '100vh',
  'border-radius': '17px',
  width:'100%',
   backgroundColor: '#ffffff',
  //backgroundColor: theme.palette.background.default,
  padding: theme2.spacing(2),
}));

const TabStrip = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 'calc(100% + 1px)',
  left: 0,
  height: 2,
  backgroundColor: theme2.palette.primary.main,
  transition: '0.3s',
}));



export { CrystalButton, ColoredTabs, ColoredTab, CenteredBox, CenteredBoxInfo,TabStrip  };
 