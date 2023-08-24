import {
  Box,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import tree from "./mock";
import { ArrowForward, ArrowUpward, Circle } from "@mui/icons-material";
import { useMemo, useState } from "react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function RenderCompanies({
  companies = [],
  sendCompany = (address) => {},
  addChildren = (children, childrenAddress) => {},
}) {
  return (
    <>
      {companies.map((company, index, array) => {
        const currentIsHere = array.some((company) => company.companyId === 0);

        return (
          <Box key={`company-${company.companyId}`}>
            <Box display="flex" alignItems="center">
              <Tooltip
                title={`Tornar "${company.companyName}" mãe da empresa atual`}
                disableInteractive
              >
                <IconButton onClick={() => sendCompany(company.address)}>
                  {company.companyId === 0 ? <Circle /> : <ArrowForward />}
                </IconButton>
              </Tooltip>
              {company.companyId !== 0 && currentIsHere && (
                <Tooltip
                  title={`Tornar "${company.companyName}" filha da empresa atual`}
                  disableInteractive
                >
                  <IconButton
                    onClick={() => addChildren(company, company.address)}
                  >
                    <ArrowUpward />
                  </IconButton>
                </Tooltip>
              )}
              <Typography fontWeight={company.companyId === 0 ? "600" : "400"}>
                {company.companyName}
              </Typography>
            </Box>
            {company.children.length > 0 && (
              <Box paddingLeft="2rem">
                <RenderCompanies
                  companies={company.children}
                  sendCompany={sendCompany}
                  addChildren={addChildren}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}

function App() {
  const defaultValue = {
    companyName: "EMPRESA ATUAL",
    companyId: 0,
    children: [],
    address: [0, 0],
  };

  const addressedTree = useMemo(() => {
    const arrayWithAddress = (array, address) =>
      array.map((item, index) => ({
        ...item,
        address: [...address, index],
        children: arrayWithAddress(item.children, [...address, index]),
      }));

    return arrayWithAddress(tree, []);
  }, [tree]);

  const [state, setState] = useState([
    {
      ...addressedTree[0],
      children: [defaultValue, ...addressedTree[0].children],
    },
  ]);
  const [currentAddress, setCurrentAddress] = useState([0, 0]);

  const [currentChildren, setCurrentChildren] = useState([]);

  const sendCompany = (
    address = [],
    children = [],
    currentTree = state,
    fromTree = true
  ) => {
    const newState = structuredClone(fromTree ? addressedTree : currentTree);

    let itemToAdd = newState;

    address.forEach((level) => (itemToAdd = itemToAdd[level].children));

    itemToAdd.unshift({
      ...defaultValue,
      children,
      address,
    });

    setState([...newState]);
    setCurrentAddress(address);
    setCurrentChildren(children);
  };

  const addChildren = (children) => {
    const newChildren = structuredClone([...currentChildren, children]);

    const stateWithoutChildren = structuredClone(addressedTree);

    let arrayToRemoveItems = stateWithoutChildren;

    const childAddress = newChildren[0].address;

    childAddress.forEach((level, index) => {
      const notIsLastButOne = index < childAddress.length - 2;

      if (notIsLastButOne) {
        arrayToRemoveItems = arrayToRemoveItems[level].children;
      }
    });

    arrayToRemoveItems[childAddress[childAddress.length - 2]].children =
      structuredClone(
        arrayToRemoveItems[
          childAddress[childAddress.length - 2]
        ].children.filter(
          (item) =>
            !newChildren.some((children) => {
              console.log({
                children,
                item,
                teste: children.companyId === item.companyId,
              });
              return children.companyId === item.companyId;
            })
        )
      );

    sendCompany(currentAddress, newChildren, stateWithoutChildren, false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main>
        <Container>
          <Paper>
            <Box padding="0.5rem">
              <RenderCompanies
                companies={state}
                address={[]}
                sendCompany={sendCompany}
                addChildren={addChildren}
              />
            </Box>
          </Paper>
        </Container>
      </main>
    </ThemeProvider>
  );
}

export default App;
