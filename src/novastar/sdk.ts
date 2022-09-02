const edge = require('edge-js');

export const helloWorld = edge.func({
	source: `
    async (input) => { 
        return ".NET Welcomes " + input.ToString(); 
    }
`,
	references: ['System.dll',
		'E:\\Projects\\22-08-09-D-CH\\novastar-ws\\references\\ClassLibraryDotNetFrameworkDll.dll',
	],
});

export const testSDKNovastar = edge.func({
	source: 'E:\\Projects\\22-08-09-D-CH\\novastar-ws\\src\\novastar\\cs\\Program.cs',
	references: ['System.dll',
		'E:\\Projects\\22-08-09-D-CH\\novastar-ws\\references\\ClassLibraryDotNetFrameworkDll.dll',
	],
});

// export const testSDKNovastarDll = edge.func({
// 	// eslint-disable-next-line func-names, object-shorthand
// 	source: function () {
// 		/* async(input) => {
// 		calculation test = new calculation();
// 		return test.Add(2,5); }
// 	*/
// 	},
// 	references: ['System.dll',
// 		'E:\\Projects\\22-08-09-D-CH\\novastar-ws\\references\\ClassLibraryDotNetFrameworkDll.dll',
// 	],
// });

export function testEdge() {
	helloWorld('JavaScript', (error: any, result: any) => {
		if (error) throw error;
		console.log(result);
	});
	testSDKNovastar((error: any, result: any) => {
		if (error) throw error;
		console.log(result);
	});
}
