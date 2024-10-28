import styled from 'styled-components';

export const ButtonContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background-color: var(--color-base-30);
        margin-top: 20px;
    }
`;

export const PaginationButton = styled.button`
    &:disabled {
        background-color: var(--color-base-50);
        cursor: not-allowed;
    }
`;
