import styled from "@emotion/styled"

export const Link = styled.a<{color?: string}>`
  color: ${({ color }) => color || '#3aa3f2'};
  font-family: Roboto;
  font-size: 16px;
  margin: 12px 0;
  letter-spacing: 0.08px;
  line-height: 21px;
  text-decoration: none;
`;
