import styled from 'styled-components';

export const PaginationContainer = styled.div`
    display: table;
    width: 100%;
    background-color: var(--color-base-10);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
`;

export const DiagramItem = styled.div`
    display: flex;
    color: var(--text-normal);
    transition: opacity 0.3s ease-in-out;
    &.fade-enter {
        opacity: 0;
    }
    &.fade-enter-active {
        opacity: 1;
    }
    &.fade-exit {
        opacity: 1;
    }
    &.fade-exit-active {
        opacity: 0;
    }

    & + & {
        border-top: 1px solid var(--color-base-70);
    }
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
`;

export const PaginationButton = styled.button`
    &:disabled {
        background-color: var(--color-base-50);
        cursor: not-allowed;
    }
`;

export const UIButton = styled.button``;
