import "./App.css";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import NFT from "./abi/msNFT.json";

const NFT_CONTRACT_ADDRESS = "0xE2738972823EDfE29341050e6c5B5F8105b86CdB";

function App() {
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [date, setDate] = useState("1992-08-31");
    const [zodiacSign, setZodiacSign] = useState(null);

    // state for whether the app is minting or not.
    const [isMinting, setIsMinting] = useState(false);

    const [NFTContract, setNFTContract] = useState(null);

    const [account, setAccount] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            setIsWalletInstalled(true);
        }
    }, []);

    function handleDateInput({ target }) {
        setDate(target.value);
    }

    async function connectWallet() {
        window.ethereum
            .request({
                method: "eth_requestAccounts",
            })
            .then((accounts) => {
                setAccount(accounts[0]);
            })
            .catch((error) => {
                alert("Something went wrong");
            });
    }

    useEffect(() => {
        calculateZodiacSign(date);
    }, [date]);


    function calculateZodiacSign(date) {
        const zodiacSigns = [
            { name: "Capricorn", startDay: 22, startMonth: 11 },
            { name: "Aquarius", startDay: 20, startMonth: 0 },
            { name: "Pisces", startDay: 19, startMonth: 1 },
            { name: "Aries", startDay: 21, startMonth: 2 },
            { name: "Taurus", startDay: 20, startMonth: 3 },
            { name: "Gemini", startDay: 21, startMonth: 4 },
            { name: "Cancer", startDay: 21, startMonth: 5 },
            { name: "Leo", startDay: 23, startMonth: 6 },
            { name: "Virgo", startDay: 23, startMonth: 7 },
            { name: "Libra", startDay: 23, startMonth: 8 },
            { name: "Scorpio", startDay: 23, startMonth: 9 },
            { name: "Sagittarius", startDay: 22, startMonth: 10 },
        ];
    
        let dateObject = new Date(date);
        let day = dateObject.getDate();
        let month = dateObject.getMonth();
    
        for (let i = 0; i < zodiacSigns.length; i++) {
            const sign = zodiacSigns[i];
            if ((month === sign.startMonth && day >= sign.startDay) || (month === (sign.startMonth + 1) % 12 && day < sign.startDay)) {
                setZodiacSign(sign.name);
                break;
            }
        }
    }
    

    useEffect(() => {
        function initNFTContract() {
            const provider = new BrowserProvider(window.ethereum);
            provider.getSigner().then((signer) => {
                setNFTContract(new Contract(NFT_CONTRACT_ADDRESS, NFT.abi, signer));
            }).catch((error) => {
                console.error("Error initializing contract:", error);
            });
        }
        initNFTContract();
    }, [account]);

    async function mintNFT() {
        setIsMinting(true);
        try {
            const transaction = await NFTContract.mintNFT(account, zodiacSign);

            // Wait for the transaction to be confirmed
            await transaction.wait();

            // Transaction is confirmed, you can perform any additional actions here if needed
        } catch (e) {
            console.error(e);
        } finally {
            alert("Minting Successful")
            setIsMinting(false);
        }
    }

    if (account === null) {
        return (
            <div className="App">
                {" "}
                <br />
                {isWalletInstalled ? (
                    <button onClick={connectWallet}>Connect Wallet</button>
                ) : (
                    <p>Install Metamask wallet</p>
                )}
            </div>
        );
    }
    return (
        <div className="App">
            <h1>MySepolia NFT Minting Dapp</h1>
            <p>Connected as: {account}</p>

            <input onChange={handleDateInput} value={date} type="date" id="dob" />
            <br />
            <br />
            {zodiacSign ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMinYMin meet"
                    viewBox="0 0 300 300"
                    width="400px"
                    height="400px"
                >
                    <style>{`.base { fill: white; font-family: serif; font-size: 24px;`}</style>
                    <rect width="100%" height="100%" fill="black" />
                    <text
                        x="50%"
                        y="50%"
                        class="base"
                        dominant-baseline="middle"
                        text-anchor="middle"
                    >
                        {zodiacSign}
                    </text>
                </svg>
            ) : null}

            <br />
            <br />
            <button disabled={isMinting} onClick={mintNFT}>
                {isMinting ? "Minting..." : "Mint"}
            </button>
        </div>
    );
}
export default App;
