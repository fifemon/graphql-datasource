import {flatten} from './util.ts'

test('flatten function test', () => {
  
	let obj = {
		"string":"hello",
		"number":123,
		"float":123.4,
		"null":null,
		"undefined":undefined,
		"array":[1,2,3],
		"nested": {
			"string":"hello",
			"number":123,
			"float":123.4,
			"null":null,
			"undefined":undefined,
		}	
	}

	let flattenObj = {
		"string":"hello",
		"number":123,
		"float":123.4,
		"null":null,
		"undefined":undefined,
		"array":[1,2,3],
		"nested.string":"hello",
		"nested.number":123,
		"nested.float":123.4,
		"nested.null":null,
		"nested.undefined":undefined,
	}


	expect(flatten(obj)).toMatchObject(flattenObj);
});
