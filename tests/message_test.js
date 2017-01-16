const { expect } = require('chai');
const message = require('../server/utils/message');

describe('genereateMessage', () => {
    it('should generate correct message object', () => {
        const from = 'Me';
        const text = 'Private Message';
        const msg = message(from, text);

        expect(msg.createdAt).to.be.a('number');
        expect(msg).to.include({ from, text });
    });
});
