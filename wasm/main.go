//go:build js && wasm
// +build js,wasm

package main

import (
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
var SetAddressConfigCallback = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	address.SetAddressConfig(args[0].String())
	callback := args[1]
	callback.Invoke(js.ValueOf(true))
	return nil
})

//
var GenerateAddressCallback = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	var publicKey []byte = TypedArrayToByteSlice(args[0])
	address := address.GenerateAddress(publicKey)
	callback := args[1]
	callback.Invoke(address.String())
	return nil
})

//
var GetHRPNetworkCallback = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	var addr address.Address
	hrp := addr.GetHRPNetwork()
	callback := args[0]
	callback.Invoke(hrp)
	return nil
})

func RegisterCallbacks() {
	js.Global().Set("__setAddressConfig", SetAddressConfigCallback)
	js.Global().Set("__generateBech32Address", GenerateAddressCallback)
	js.Global().Set("__getHRPNetwork", GetHRPNetworkCallback)
}

func CleanUp() {
	js.Global().Set("__generateBech32Address", js.Undefined())
	js.Global().Set("__getHRPNetwork", js.Undefined())
	js.Global().Set("__setAddressConfig", js.Undefined())
}

func main() {
	RegisterCallbacks()

	<-c

	CleanUp()
	GenerateAddressCallback.Release()
	GetHRPNetworkCallback.Release()
	SetAddressConfigCallback.Release()
}
