//go:build js && wasm
// +build js,wasm

package main

import (
	"encoding/hex"
	"syscall/js"

	"github.com/spacemeshos/address"
)

var c chan bool

func init() {
	c = make(chan bool)
}

func TypedArrayToByteSlice(arg js.Value) []byte {
	length := arg.Length()
	bytesToReturn := make([]byte, length)
	for i := 0; i < length; i++ {
		bytesToReturn[i] = byte(arg.Index(i).Int())
	}
	return bytesToReturn
}

//
var SetHRPNetwork = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	address.SetAddressConfig(args[0].String())
	return nil
})

//
var GenerateAddress = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	var publicKey []byte = TypedArrayToByteSlice(args[0])
	address := address.GenerateAddress(publicKey)
	return js.ValueOf(address.String())
})

//
var GetHRP = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	var addr address.Address
	hrp := addr.GetHRPNetwork()
	return js.ValueOf(hrp)
})

//
var Parse = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	input := args[0]
	addr, err := address.StringToAddress(input.String())
	if err != nil {
		return []interface{}{err.Error(), nil}
	}
	hexAddr := hex.EncodeToString(addr.Bytes())
	return []interface{}{nil, hexAddr}
})

func RegisterCallbacks() {
	js.Global().Set("__getHRPNetwork", GetHRP)
	js.Global().Set("__setHRPNetwork", SetHRPNetwork)
	js.Global().Set("__generateAddress", GenerateAddress)
	js.Global().Set("__parse", Parse)
}

func CleanUp() {
	js.Global().Set("__getHRPNetwork", js.Undefined())
	js.Global().Set("__setAddressConfig", js.Undefined())
	js.Global().Set("__generateAddress", js.Undefined())
	js.Global().Set("__parse", js.Undefined())
}

func main() {
	RegisterCallbacks()

	<-c

	CleanUp()
	GenerateAddress.Release()
	GetHRP.Release()
	SetHRPNetwork.Release()
	Parse.Release()
}
