/**
 * 不要让我看你的文档，请让我看你的代码（测试用例)
 * 测试用例相关demo
 */

describe('egg test', () => {
  before(() => console.log('order 1'));
  before(() => console.log('order 2'));
  after(() => console.log('order 6'));
  beforeEach(() => console.log('order 3'));
  afterEach(() => console.log('order 5'));
  it('should worker', () => console.log('order 4'));
});
