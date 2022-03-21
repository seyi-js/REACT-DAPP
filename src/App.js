import React, { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {
  MARKETPLACE_ADDRESS,
  MARKET_ABI,
  NFT_ABI,
  NFT_ADDRESS,
} from "./utils/config";

function App() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  //NFT Contract Connection
  const NFTContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
  const MarketPlaceContract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKET_ABI,
    provider
  );

  const [state, setState] = useState({
    wallet_address: [],
    signer: null,
    message: "",
    signature: "",
    listing_price: 0,
  });
  const connectToMetaMask = async () => {
    const result = await provider.send("eth_requestAccounts", []);
    setState({ ...state, wallet_address: result });

    //console.log(result);
  };

  const getSigner = async () => {
    const signer = provider.getSigner();

    return signer;
  };

  const signMessage = async () => {
    const signer = await getSigner();
    const signature = await signer.signMessage(state.message);

    setState({ ...state, signature: signature });
  };

  const setMarketAddress = async (NFT) => {
    //SetMarketPlace Address
    return await NFT.setMarketPlaceAddress(MARKETPLACE_ADDRESS);
  };

  const MintToken = async (NFT, tokenURI) => {
    return await NFT.createToken(tokenURI);
  };

  const createMarketItem = async (MARKET, token) => {
    const auctionPrice = ethers.utils.parseUnits("0.015", "ether");
    await MARKET.createMarketItem(NFT_ADDRESS, token, auctionPrice, {
      value: ethers.utils.parseUnits(state.listing_price, "ether"),
    });
  };

  const createMarketItemSale = async (MARKET, token) => {
    const auctionPrice = ethers.utils.parseUnits("0.015", "ether");
    await MARKET.createMarketSale(NFT_ADDRESS, token, {
      value: auctionPrice,
      //from: await provider.listAccounts()[0],
    });
  };
  const DoSomeJob = async () => {
    try {
      console.log(
        ethers.utils.formatEther(
          await (
            await provider.getBalance(state.wallet_address[0])
          )._hex
        )
      );
      const signer = await getSigner();
      const NFT = NFTContract.connect(signer);
      const MARKET = MarketPlaceContract.connect(signer);

      const listing_price = await MARKET.getListingPrice();

      setState({
        ...listing_price,
        listing_price: ethers.utils.formatEther(listing_price._hex),
      });

      //await setMarketAddress(NFT);

      //const result = await MintToken(NFT, "seyijsismyname3");
      // const result = await createMarketItem(MARKET, 1);
      const result = await createMarketItemSale(MARKET, 1);

      console.log(result);
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <section className="home">
      <h1>Address(es)</h1>

      {state.wallet_address?.map((x, i) => (
        <p key={i}>{x}</p>
      ))}

      <button onClick={() => connectToMetaMask()}>
        {" "}
        Connect To MetaMask Wallet
      </button>

      <input
        type="text"
        onChange={(e) => setState({ ...state, message: e.target.value })}
      />

      <h1>Signature</h1>

      <p>{state.signature ? state.signature : null}</p>

      {/* {state.wallet_address.length ? (
        <button onClick={() => signMessage()}> Sign Message</button>
      ) : null} */}

      <h1>Listing Price</h1>

      <p>{state.listing_price ? state.listing_price : null} ether</p>

      <button onClick={() => DoSomeJob()}> DoSomeJob</button>
    </section>
  );
}

export default App;
