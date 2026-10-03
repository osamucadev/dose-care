// Jest stand-in for `.svg` imports, which Metro turns into components
// via react-native-svg-transformer but Jest cannot.
const SvgMock = () => null;
module.exports = SvgMock;
module.exports.default = SvgMock;
