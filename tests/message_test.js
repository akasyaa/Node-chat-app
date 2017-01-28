const { expect } = require('chai');
const { generateMessage, generateLocationMessage } = require('../server/utils/message');

describe('genereateMessage', () => {
    it('should generate correct message object', () => {
        const from = 'Me';
        const text = 'Private Message';
        const msg = generateMessage(from, text);

        expect(msg.createdAt).to.be.a('number');
        expect(msg).to.include({ from, text });
    });
});


describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        const from = 'Me';
        const lat = 123;
        const lng = 456;
        const msg = generateLocationMessage(from, lat, lng);

        const url = `https://www.google.com/maps?q=${lat},${lng}`

        expect(msg.createdAt).to.be.a('number');
        expect(msg).to.include({ from, url });
    })
})
