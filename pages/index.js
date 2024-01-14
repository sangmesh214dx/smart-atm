import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";


const translations = {
  en: {
    welcomeMessage: "Welcome to the Metacrafters ATM!",
    yourAccount: "Your Account:",
    yourBalance: "Your Balance:",
    depositButton: "Deposit 1 ETH",
    withdrawButton: "Withdraw 1 ETH",
    installMetamask: "Please install Metamask in order to use this ATM.",
    connectMetamask: "Please connect your Metamask wallet",
    transactionSuccess: "Transaction successful!",
  },
  kn: {
    welcomeMessage: "ಮೇಟಾಕ್ರಾಫ್ಟರ್ಸ್ ಎಟಿಎಂಗೆ ಸುಸ್ವಾಗತ!",
    yourAccount: "ನಿಮ್ಮ ಖಾತೆ:",
    yourBalance: "ನಿಮ್ಮ ಶೇಕಡಾ:",
    depositButton: "1 ಇಥರ್ ಡಿಪೋಸಿಟ್",
    withdrawButton: "1 ಇಥರ್ ವಿದ್ರಾಸ್",
    installMetamask: "ಈ ಎಟಿಎಂನ್ನು ಬಳಸಲು ಮೇಟಾಮಾಸ್ಕ್ ಅನ್ನು ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ.",
    connectMetamask: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೇಟಾಮಾಸ್ಕ್ ವಾಲೆಟ್ ಕನೆಕ್ಟ್ ಮಾಡಿ",
    transactionSuccess: "ಲಾಭಕರ ವ್ಯಾಪಾರ!",
  },
  te: {
    welcomeMessage: "మేటాక్రాఫ్టర్స్ ఎటిఎంకు స్వాగతం!",
    yourAccount: "మీ ఖాతా:",
    yourBalance: "మీ బ్యాలెన్స్:",
    depositButton: "1 ఇథర్ డిపాజిట్",
    withdrawButton: "1 ఇథర్ విడ్రా",
    installMetamask: "దయచేసి ఈ ఎటిఎంన్ను ఉపయోగించడానికి మేటామాస్క్ ఇన్స్టాల్ చేయండి.",
    connectMetamask: "మీ మేటామాస్క్ వాలెట్ను కనెక్ట్ చేయండి",
    transactionSuccess: "వ్యాపార విజయవంతం!",
  },
};

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Access translations based on the selected language
  const translation = translations[currentLanguage];

  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
        alert(`${translation.transactionSuccess}\nTransaction Hash: ${tx.hash}`);
      } catch (error) {
        console.error("Deposit failed:", error);
        alert("Deposit failed. Please check the console for more details.");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
        alert(`${translation.transactionSuccess}\nTransaction Hash: ${tx.hash}`);
      } catch (error) {
        console.error("Withdrawal failed:", error);
        alert("Withdrawal failed. Please check the console for more details.");
      }
    }
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>{translation.installMetamask}</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>{translation.connectMetamask}</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>
          {translation.yourAccount} {account}
        </p>
        <p>
          {translation.yourBalance} {balance}
        </p>
        <button onClick={deposit}>{translation.depositButton}</button>
        <button onClick={withdraw}>{translation.withdrawButton}</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: getBackgroundColor(currentLanguage) }}>
      <header>
        <h1>{translation.welcomeMessage}</h1>
        <div>
          {/* Language Selector */}
          {Object.keys(translations).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setCurrentLanguage(lang);
              }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}


function getBackgroundColor(language) {
  switch (language) {
    case "en":
      return "#f2f2f2"; // Grey color 
    case "kn":
      return "#FF9933"; // Saffron
    case "te":
      return "#4CAF50"; // Green
    default:
      return "#f2f2f2"; // 
  }
}

