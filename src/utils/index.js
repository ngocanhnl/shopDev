'use strict'


const _ = require('lodash')

const getInfoData = ({fileds=[], object={} })=>{
    return _.pick(object,fileds)
}

//['a', 'b'] => {a:1, b: 1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map( el => [el,1]))
}
//['a', 'b'] => {a:1, b: 1}
const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map( el => [el,0]))
}


const removeUndefineObject = obj => {
    // console.log(`1-----Remove`,obj)
    Object.keys(obj).forEach(k =>{
         if(obj[k] == null) delete obj[k]
    })
    // console.log(`2-----Remove`,obj)
    return obj
}
// const updateNestedObjectParser = object => {
//     const final = {};
//     console.log(`update nes`, object)
//     Object.keys(object || {}).forEach(key => {
//       if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
//         const response = updateNestedObjectParser(object[key]);
  
//         Object.keys(response || {}).forEach(a => {
//           final[`${key}.${a}`] = response[a];
//         });
//       } else {
//         final[key] = object[key];
//       }
//     });
//     console.log(`update nes fina`, final)
//     return final;
//   }

/*
    {
        a: 1,
        b: {
            c, 
            d
        }
    }
    => {
        a:1,
        b,c: 1,
        b,d: 1
    }

*/ 

const updateNestedObjectParser = obj => {
    // console.log(`::1::obj`, obj)
    obj = removeUndefineObject(obj)
    const final = {}
    Object.keys(obj).forEach(k =>{
        
        // console.log('TypeOf obj[k]',typeof obj[k])
        if(typeof obj[k] === 'object' && !Array.isArray(obj[k])){
            const response = updateNestedObjectParser(obj[k])
            Object.keys(response).forEach(a=>{
                final[`${k}.${a}`] = response[a]
            })
        }
        else{
            final[k] = obj[k]
        }
    })
    // console.log(`::2::final`, final)
    return final
}
module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefineObject,
    updateNestedObjectParser

}