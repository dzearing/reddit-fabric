import * as React from 'react';

import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DetailsList, Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { FontClassNames } from 'office-ui-fabric-react/lib/Styling';

const SUBREDDIT = 'bostonterriers';
const THUMBSIZE = 80;

// tslint:disable:no-any

let columns = [
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 40,
        maxWidth: 40,
        isResizable: true
    },
    {
        key: 'thumb',
        name: '',
        fieldName: 'thumb',
        minWidth: THUMBSIZE,
        maxWidth: THUMBSIZE,
        onRender: (item: any) => (
            <Image
                className='thumb'
                imageFit={ImageFit.cover}
                src={item.thumb}
                width={THUMBSIZE}
                height={THUMBSIZE}
            />)
    },
    {
        key: 'article',
        name: 'Post',
        fieldName: '',
        minWidth: 100,
        maxWidth: 180,
        isResizable: true,
        onRender: (item: any) => (
            <div style={{ whiteSpace: 'normal' }}>
                <Link className={ FontClassNames.xLarge } href={item.url} target='_blank'>{item.title}</Link>
                <div className='itemMetadata'>
                    <span>{'By' + item.author}</span>
                    <Icon iconName='Chat' />
                    <span>&nbsp; {item.comments} comment{item.comments === 1 ? '' : 's'}</span>
                </div>
            </div>
        )
    }
];

const refreshButtonStyles = {
    root: {
        verticalAlign: 'middle'
    }
};

export class Reddit extends React.Component<{}, any> {
    private _selection: Selection;

    constructor() {
        super();

        this._selection = new Selection();
        this.state = {
            rows: null,
            isLoading: false,
            subreddit: SUBREDDIT,
            nextPageToken: null
        };
        this._onReloadClick = this._onReloadClick.bind(this);
    }

    public componentDidMount() {
        this._onReloadClick();
    }

    public render() {
        let { rows, subreddit, isLoading } = this.state;

        return (
            <div className='foo'>
                <div className={FontClassNames.xxLarge + ' titleArea'}>
                    <span className='title'>reddit/r/<Link className='reddit'>{subreddit}</Link></span>
                    {!isLoading ? (
                        <IconButton
                            styles={refreshButtonStyles}
                            // className='refresh'
                            iconProps={{ iconName: 'Refresh' }}
                            onClick={this._onReloadClick}
                        />
                    ) : (
                            <Spinner className='inlineSpinner' />
                        )}
                </div>
                {rows && (
                    <MarqueeSelection selection={this._selection}>
                        <DetailsList
                            items={rows}
                            columns={columns}
                            selection={this._selection}
                            onRenderMissingItem={() => this._onDelayedLoadNextPage()}
                        />
                        {isLoading && (
                            <Spinner className='loadingSpinner' label='Loading...' />
                        )}
                    </MarqueeSelection>
                )}

            </div>
        );
    }

    private _onReloadClick() {
        this.setState({ rows: null, nextPageToken: null });

        this._onLoadNextPage();
    }

    private _onDelayedLoadNextPage(): any {
        let { isLoading } = this.state;

        if (!isLoading) {
            this.setState({ isLoading: true });

            // This setTimeout is only here for illustrating a slow API. Reddit API is pretty fast.
            setTimeout(() => this._onLoadNextPage(), 1000);
        }
    }

    private _onLoadNextPage() {
        let { subreddit, nextPageToken } = this.state;
        let url = `https://www.reddit.com/r/` +
            `${subreddit}.json` +
            `${nextPageToken ? '?after=' + nextPageToken : ''}`;

        this.setState({ isLoading: true });

        fetch(url).then(
            response => response.json()).then(json => {
                let rows = this._getRowsFromData(json.data);

                this.setState({
                    rows,
                    nextPageToken: json.data.after,
                    isLoading: false
                });

                this._selection.setItems(rows);
            });
    }

    private _getRowsFromData(response: any) {
        let { rows, nextPageToken } = this.state;

        let items = response.children.map((child: any) => {
            let data = child.data;
            return {
                key: data.id,
                subreddit: data.subreddit,
                title: data.title,
                author: data.author,
                url: data.url,
                score: data.score,
                thumb: data.thumbnail,
                comments: data.num_comments
            };
        });

        if (rows && nextPageToken) {
            items = rows.slice(0, rows.length - 1).concat(items);
        }

        if (response.after) {
            items.push(null);
        }

        return items;
    }
}
